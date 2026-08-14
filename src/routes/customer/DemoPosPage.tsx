import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { posApi } from '../../api/pos'
import { env, isApiConfigured } from '../../config/env'
import type { TimeSaleRecommendation } from '../../types/admin'
import { mapApiRecommendation } from '../../utils/adminApiMappers'

const demoMenus = [
  {
    id: 'americano',
    name: '아메리카노',
    price: 5000,
  },
  {
    id: 'cake',
    name: '딸기케이크',
    price: 7000,
  },
  {
    id: 'latte',
    name: '카페라떼',
    price: 6000,
  },
]

type DemoMenu = (typeof demoMenus)[number]

type PosPromotion = {
  title: string
  discountRate: number
}

interface QrReceipt {
  connectUrl: string
  dataUrl: string
  expiresAt: string
}

function createCustomerConnectUrl(orderClaim: string) {
  const baseUrl = env.customerAppUrl.trim() || window.location.origin
  const connectUrl = new URL('/connect', baseUrl)
  connectUrl.searchParams.set('orderClaim', orderClaim)
  return connectUrl.toString()
}

export function DemoPosPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isExtendMode = searchParams.get('mode') === 'extend'
  const [selectedIds, setSelectedIds] = useState<string[]>(
    isExtendMode ? ['americano'] : ['americano', 'cake'],
  )
  const [storeId, setStoreId] = useState(env.demoStoreId)
  const [productId, setProductId] = useState(env.demoProductId)
  const [phone, setPhone] = useState(
    window.sessionStorage.getItem('portalPhone') ?? '01011111111',
  )
  const [menuPromotions, setMenuPromotions] = useState<Record<string, PosPromotion>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [qrReceipt, setQrReceipt] = useState<QrReceipt | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const canUseApi = env.useCustomerApi && isApiConfigured

  useEffect(() => {
    if (!canUseApi) return

    let isCanceled = false

    adminApi
      .getRecommendations()
      .then((response) => {
        if (isCanceled) return
        setMenuPromotions(getDemoMenuPromotions(response.data.map(mapApiRecommendation)))
      })
      .catch(() => {
        if (!isCanceled) setMenuPromotions({})
      })

    return () => {
      isCanceled = true
    }
  }, [canUseApi])

  const selectedMenus = useMemo(
    () => demoMenus.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  )
  const pricedSelectedMenus = useMemo(
    () => selectedMenus.map((item) => getMenuPricing(item, menuPromotions[item.id])),
    [menuPromotions, selectedMenus],
  )
  const totalAmount = pricedSelectedMenus.reduce((sum, item) => sum + item.price, 0)
  const discountAmount = pricedSelectedMenus.reduce(
    (sum, item) => sum + item.discountAmount,
    0,
  )

  function toggleMenu(menuId: string) {
    setSelectedIds((current) => {
      if (current.includes(menuId)) {
        return current.length === 1 ? current : current.filter((id) => id !== menuId)
      }

      return [...current, menuId]
    })
  }

  async function handleCreateOrder() {
    setErrorMessage('')
    setQrReceipt(null)
    setIsCopied(false)
    setIsSubmitting(true)

    try {
      const normalizedPhone = phone.replace(/\D/g, '')
      window.sessionStorage.setItem('portalPhone', normalizedPhone)

      if (!canUseApi) {
        if (isExtendMode) {
          navigate('/connect?screen=active')
          return
        }

        const connectUrl = createCustomerConnectUrl(`demo-${Date.now()}`)
        const dataUrl = await QRCode.toDataURL(connectUrl, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 320,
          color: { dark: '#111111', light: '#ffffff' },
        })
        setQrReceipt({
          connectUrl,
          dataUrl,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        })
        return
      }

      if (!storeId.trim() || !productId.trim()) {
        setErrorMessage('API 모드에서는 seed 결과의 storeId와 productId가 필요합니다.')
        return
      }

      const response = await posApi.createOrder({
        storeId: storeId.trim(),
        externalOrderId: `${isExtendMode ? 'EXTEND' : 'DEMO'}-${Date.now()}`,
        customer: {
          phone: normalizedPhone,
        },
        items: [
          {
            productId: productId.trim(),
            quantity: 1,
            unitPrice: totalAmount,
          },
        ],
        totalAmount,
        paidAt: new Date().toISOString(),
      })

      window.sessionStorage.setItem(
        'portalRewardGrantIds',
        JSON.stringify(response.newRewardGrantIds),
      )

      if (isExtendMode) {
        navigate('/connect?screen=active')
        return
      }

      const connectUrl = createCustomerConnectUrl(response.orderClaim.token)
      const dataUrl = await QRCode.toDataURL(connectUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: { dark: '#111111', light: '#ffffff' },
      })
      setQrReceipt({
        connectUrl,
        dataUrl,
        expiresAt: response.orderClaim.expiresAt,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '주문표 QR 생성 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopyLink() {
    if (!qrReceipt) return

    try {
      await navigator.clipboard.writeText(qrReceipt.connectUrl)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setErrorMessage('링크를 복사하지 못했습니다. 주소를 직접 선택해 복사해주세요.')
    }
  }

  return (
    <main className="demo-pos">
      <section className="demo-pos__panel" aria-label="Demo POS">
        <div className="demo-pos__header">
          <p>Penguin Port Demo POS</p>
          <strong>{canUseApi ? 'API 모드' : 'Mock 모드'}</strong>
        </div>

        <div className="demo-pos__content">
          <div>
            <span className="demo-pos__eyebrow">
              {isExtendMode ? '추가 주문' : '주문 생성'}
            </span>
            <h1>
              {isExtendMode
                ? '추가 주문으로 이용 시간을 연장합니다'
                : '주문 후 고객 QR을 발급합니다'}
            </h1>
            <p>
              {isExtendMode
                ? '같은 전화번호로 주문하면 백엔드가 기존 이용권 시간을 자동으로 늘립니다.'
                : 'MVP 시연용 POS 화면입니다. 주문을 생성하면 Customer Portal의 QR 흐름으로 이동합니다.'}
            </p>
          </div>

          <div className="demo-pos__menus">
            {demoMenus.map((menu) => {
              const promotion = menuPromotions[menu.id]
              const pricing = getMenuPricing(menu, promotion)

              return (
                <button
                  className={selectedIds.includes(menu.id) ? 'selected' : ''}
                  key={menu.id}
                  type="button"
                  onClick={() => toggleMenu(menu.id)}
                >
                  <span className="demo-pos__menu-name">
                    <span>{menu.name}</span>
                    {promotion ? <small>{promotion.discountRate}% 할인 적용</small> : null}
                  </span>
                  <strong className="demo-pos__menu-price">
                    {pricing.originalPrice > pricing.price ? (
                      <del>{pricing.originalPrice.toLocaleString()}원</del>
                    ) : null}
                    <span>{pricing.price.toLocaleString()}원</span>
                  </strong>
                </button>
              )
            })}
          </div>

          <div className="demo-pos__summary">
            <div>
              <span>선택 메뉴</span>
              <strong>{selectedMenus.length}개</strong>
            </div>
            {discountAmount > 0 ? (
              <div>
                <span>프로모션 할인</span>
                <strong>-{discountAmount.toLocaleString()}원</strong>
              </div>
            ) : null}
            <div>
              <span>결제 금액</span>
              <strong>{totalAmount.toLocaleString()}원</strong>
            </div>
            <div>
              <span>{isExtendMode ? '연장 방식' : '제공 이용권'}</span>
              <strong>{isExtendMode ? '기존 이용권 자동 연장' : '2시간 기본'}</strong>
            </div>
          </div>

          {canUseApi ? (
            <div className="demo-pos__fields">
              <label>
                <span>storeId</span>
                <input value={storeId} onChange={(event) => setStoreId(event.target.value)} />
              </label>
              <label>
                <span>productId</span>
                <input
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                />
              </label>
              <label>
                <span>고객 전화번호</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>
          ) : (
            <div className="demo-pos__notice">
              실제 백엔드 연동 테스트는 <code>VITE_USE_CUSTOMER_API=1</code> 설정 후
              storeId/productId를 입력해서 진행합니다.
            </div>
          )}

          {qrReceipt ? (
            <section className="demo-pos__qr-receipt" aria-live="polite">
              <div className="demo-pos__qr-copy">
                <span>주문 완료</span>
                <h2>고객용 QR이 발급됐습니다</h2>
                <p>고객이 휴대폰 카메라로 QR을 스캔하면 인증 화면으로 이동합니다.</p>
              </div>

              <div className="demo-pos__qr-image">
                <img src={qrReceipt.dataUrl} alt="고객 Wi-Fi 이용권 연결 QR 코드" />
              </div>

              <div className="demo-pos__qr-meta">
                <span>QR 만료</span>
                <strong>
                  {new Date(qrReceipt.expiresAt).toLocaleString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </div>

              <label className="demo-pos__qr-link">
                <span>고객 접속 주소</span>
                <input readOnly value={qrReceipt.connectUrl} onFocus={(event) => event.target.select()} />
              </label>

              <div className="demo-pos__qr-actions">
                <button type="button" onClick={() => void handleCopyLink()}>
                  {isCopied ? '복사 완료' : '링크 복사'}
                </button>
                <a href={qrReceipt.connectUrl} target="_blank" rel="noreferrer">
                  고객 화면 열기
                </a>
              </div>

              <button
                className="demo-pos__new-order"
                type="button"
                onClick={() => setQrReceipt(null)}
              >
                새 주문 만들기
              </button>
            </section>
          ) : (
            <>
              {errorMessage ? <p className="demo-pos__error">{errorMessage}</p> : null}

              <button
                className="demo-pos__submit"
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateOrder}
              >
                {isSubmitting
                  ? '주문 처리 중'
                  : isExtendMode
                    ? '추가 주문 완료'
                    : '주문표 QR 생성'}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function getDemoMenuPromotions(recommendations: TimeSaleRecommendation[]) {
  const activePromotions = recommendations.filter((recommendation) => (
    recommendation.status === 'scheduled' || recommendation.status === 'active'
  ))

  return demoMenus.reduce<Record<string, PosPromotion>>((result, menu) => {
    const promotion = activePromotions.find((recommendation) =>
      isRecommendationForMenu(recommendation, menu),
    )

    if (promotion && promotion.discountRate > 0) {
      result[menu.id] = {
        title: promotion.title ?? promotion.menu,
        discountRate: promotion.discountRate,
      }
    }

    return result
  }, {})
}

function isRecommendationForMenu(
  recommendation: TimeSaleRecommendation,
  menu: DemoMenu,
) {
  const menuName = normalizeMenuName(menu.name)
  const recommendationMenu = normalizeMenuName(recommendation.menu)
  const recommendationTitle = normalizeMenuName(recommendation.title ?? '')

  return (
    recommendationMenu.includes(menuName) ||
    menuName.includes(recommendationMenu) ||
    recommendationTitle.includes(menuName)
  )
}

function getMenuPricing(menu: DemoMenu, promotion?: PosPromotion) {
  const discountRate = promotion?.discountRate ?? 0
  const price =
    discountRate > 0
      ? Math.max(0, Math.round(menu.price * (100 - discountRate) / 100))
      : menu.price

  return {
    ...menu,
    originalPrice: menu.price,
    price,
    discountAmount: menu.price - price,
  }
}

function normalizeMenuName(value: string) {
  return value.replace(/\s/g, '').toLowerCase()
}
