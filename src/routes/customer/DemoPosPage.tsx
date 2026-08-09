import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { posApi } from '../../api/pos'
import { env, isApiConfigured } from '../../config/env'

const demoMenus = [
  {
    id: 'americano',
    name: '아메리카노',
    price: 4500,
  },
  {
    id: 'cake',
    name: '케이크',
    price: 4000,
  },
]

export function DemoPosPage() {
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState<string[]>(['americano', 'cake'])
  const [storeId, setStoreId] = useState(env.demoStoreId)
  const [productId, setProductId] = useState(env.demoProductId)
  const [phone, setPhone] = useState('01011111111')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedMenus = useMemo(
    () => demoMenus.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  )
  const totalAmount = selectedMenus.reduce((sum, item) => sum + item.price, 0)
  const canUseApi = env.useCustomerApi && isApiConfigured

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
    setIsSubmitting(true)

    try {
      if (!canUseApi) {
        navigate(`/connect?orderClaim=demo-${Date.now()}`)
        return
      }

      if (!storeId.trim() || !productId.trim()) {
        setErrorMessage('API 모드에서는 seed 결과의 storeId와 productId가 필요합니다.')
        return
      }

      const response = await posApi.createOrder({
        storeId: storeId.trim(),
        externalOrderId: `DEMO-${Date.now()}`,
        customer: {
          phone: phone.replace(/\D/g, ''),
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
      navigate(`/connect?orderClaim=${encodeURIComponent(response.orderClaim.token)}`)
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

  return (
    <main className="demo-pos">
      <section className="demo-pos__panel" aria-label="Demo POS">
        <div className="demo-pos__header">
          <p>Penguin Port Demo POS</p>
          <strong>{canUseApi ? 'API 모드' : 'Mock 모드'}</strong>
        </div>

        <div className="demo-pos__content">
          <div>
            <span className="demo-pos__eyebrow">주문 생성</span>
            <h1>주문 후 고객 QR을 발급합니다</h1>
            <p>
              MVP 시연용 POS 화면입니다. 주문을 생성하면 Customer Portal의
              <br />
              <code>/connect?orderClaim=...</code> 흐름으로 이동합니다.
            </p>
          </div>

          <div className="demo-pos__menus">
            {demoMenus.map((menu) => (
              <button
                className={selectedIds.includes(menu.id) ? 'selected' : ''}
                key={menu.id}
                type="button"
                onClick={() => toggleMenu(menu.id)}
              >
                <span>{menu.name}</span>
                <strong>{menu.price.toLocaleString()}원</strong>
              </button>
            ))}
          </div>

          <div className="demo-pos__summary">
            <div>
              <span>선택 메뉴</span>
              <strong>{selectedMenus.length}개</strong>
            </div>
            <div>
              <span>결제 금액</span>
              <strong>{totalAmount.toLocaleString()}원</strong>
            </div>
            <div>
              <span>제공 이용권</span>
              <strong>2시간 기본</strong>
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

          {errorMessage ? <p className="demo-pos__error">{errorMessage}</p> : null}

          <button
            className="demo-pos__submit"
            type="button"
            disabled={isSubmitting}
            onClick={handleCreateOrder}
          >
            {isSubmitting ? '주문표 생성 중' : '주문표 QR 생성'}
          </button>
        </div>
      </section>
    </main>
  )
}
