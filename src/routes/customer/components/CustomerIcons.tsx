const wifiIconPath = [
  'M24 34.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z',
  'M24 23c5.4 0 10.4 2.2 14 5.7l-4.3 4.3A13.7 13.7 0 0 0 24 29',
  'a13.7 13.7 0 0 0-9.7 4L10 28.7A19.8 19.8 0 0 1 24 23Z',
  'M24 11.5c8.6 0 16.4 3.5 22 9.1l-4.3 4.3A24.8 24.8 0 0 0 24 17.5',
  'a24.8 24.8 0 0 0-17.7 7.4L2 20.6a31 31 0 0 1 22-9.1Z',
].join(' ')

const wifiSmallIconPath = [
  'M12 17.7a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Z',
  'M12 12.6c2.3 0 4.4.9 5.9 2.4l-2 2a5.5 5.5 0 0 0-7.8 0',
  'l-2-2a8.3 8.3 0 0 1 5.9-2.4Z',
  'M12 7.4c3.7 0 7 1.5 9.4 3.9l-2 2A10.5 10.5 0 0 0 12 10.2',
  'a10.5 10.5 0 0 0-7.4 3.1l-2-2A13.2 13.2 0 0 1 12 7.4Z',
].join(' ')

export function WifiIcon({ dark }: { dark?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="WiFi">
      <path className={dark ? 'icon-dark' : ''} d={wifiIconPath} />
    </svg>
  )
}

export function WifiSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={wifiSmallIconPath} />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="완료">
      <path d="m19.8 31.1-7-7 2.8-2.8 4.2 4.2L32.4 13l2.8 2.8-15.4 15.3Z" />
    </svg>
  )
}
