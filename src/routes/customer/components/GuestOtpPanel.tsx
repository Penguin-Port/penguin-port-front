import { demoOtpCode } from '../customerMock'
import type { GuestOtpPanelProps } from '../customerTypes'

export function GuestOtpPanel({
  phone,
  otpCode,
  otpSent,
  otpVerified,
  errorMessage,
  cooldownSeconds,
  canSendOtp,
  canConfirmOtp,
  onPhoneChange,
  onSendOtp,
  onOtpCodeChange,
  onConfirmOtp,
}: GuestOtpPanelProps) {
  return (
    <>
      <label>
        <span>전화번호</span>
        <input
          value={phone}
          maxLength={11}
          placeholder="01011111111"
          inputMode="numeric"
          disabled={otpVerified}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="outline-button"
        disabled={!canSendOtp || otpVerified}
        onClick={onSendOtp}
      >
        {cooldownSeconds > 0 ? `재전송 ${cooldownSeconds}초` : '인증번호 발송'}
      </button>
      {otpSent && (
        <label>
          <span>인증번호 6자리</span>
          <input
            value={otpCode}
            maxLength={6}
            placeholder={demoOtpCode}
            inputMode="numeric"
            disabled={otpVerified}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? 'guest-otp-error-message' : undefined}
            onChange={(event) => onOtpCodeChange(event.target.value)}
          />
        </label>
      )}
      {otpSent && !otpVerified && (
        <button
          type="button"
          className="primary-button"
          disabled={!canConfirmOtp}
          onClick={onConfirmOtp}
        >
          인증번호 확인
        </button>
      )}
      {errorMessage && (
        <p id="guest-otp-error-message" className="otp-message error" role="alert">
          {errorMessage}
        </p>
      )}
      {otpSent && !errorMessage && !otpVerified && (
        <p className="otp-message">데모 인증번호는 {demoOtpCode}입니다.</p>
      )}
      {otpVerified && (
        <div className="notice-card success">
          <strong>본인 인증이 완료되었습니다</strong>
          <span>Portal Session이 발급되었습니다.</span>
        </div>
      )}
    </>
  )
}
