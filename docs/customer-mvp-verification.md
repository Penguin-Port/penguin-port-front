# Customer Portal MVP Verification

## Scope

- Branch: `feature/customer-api-integration-prep`
- Frontend route: `/app/demo-pos`, `/connect`
- Backend base URL: `http://127.0.0.1:8000`
- Demo OTP: `123456`

## Implemented Flow

1. Demo POS creates a paid order through `POST /pos/orders`.
2. Customer Portal enters through `/connect?orderClaim=...`.
3. Portal exchanges the claim through `POST /public/order-claims/exchange`.
4. Guest phone verification runs through:
   - `POST /public/otp/send`
   - `POST /public/otp/confirm`
5. Portal session is stored in `sessionStorage`.
6. Wi-Fi pass activation runs through `POST /public/passes/{passId}/activate`.
7. Active pass screen refreshes server state through `GET /public/passes/{passId}`.
8. Upsell and reward flow uses:
   - `GET /public/upsell-hint`
   - `GET /public/rewards/grants/{grantId}/options`
   - `POST /public/rewards/grants/{grantId}/choose`
9. Coupon flow uses:
   - `GET /public/coupons`
   - `POST /public/coupons/{couponId}/redeem`
10. Privacy screen uses `GET /public/stores/{storeId}/privacy-notice`.

## Verification

- `npm.cmd run build`: passed
- Backend `/docs`: `200 OK`
- Frontend `/app/demo-pos`: `200 OK`
- Browser E2E viewport: `390 x 844`
- Checked screens:
  - Demo POS
  - QR entry
  - OTP auth
  - Wi-Fi start
  - Active pass
  - Reward selection
  - Coupons
  - Privacy
  - Invalid claim blocked/error state
- Horizontal overflow: none on checked mobile screens
- Raw backend benefit enum labels are mapped to customer-facing Korean labels
- Coupon empty-state flicker after reward save was fixed
- Invalid claim response displays request information for staff support

## Known Notes

- `.env.local` is local-only and should not be committed.
- API mode requires:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_CUSTOMER_API=1
VITE_DEMO_STORE_ID=1090c8a7-0442-4086-9d6a-d2b7c3c5c34d
VITE_DEMO_PRODUCT_ID=b04ea77d-95fc-4797-a526-c2a7cb434239
```

## PR Summary Draft

### Summary

- Added Demo POS order creation flow for real `orderClaim` generation.
- Connected Customer Portal MVP flow to backend public APIs.
- Added pass refresh, reward selection, coupon list/redeem, privacy notice, and API error UX.
- Verified the full customer happy path with the local backend demo seed.

### Test

- `npm.cmd run build`
- Browser E2E: `/app/demo-pos` to `/connect`, OTP, activation, reward, coupon, privacy, invalid claim
- Backend smoke checks for POS order, OTP, pass activation, pass extension, reward options, reward choose, coupon list/redeem
