import {createElement} from 'react';
import Script from 'next/script';

export default function GivebutterDonation() {
  return (
    <>
      <Script
        id="givebutter-widget-library"
        src="https://widgets.givebutter.com/latest.umd.cjs?acct=bYEEgM40JS7MRtU1&p=other"
        strategy="afterInteractive"
      />
      {createElement('givebutter-widget', {
        id: 'j2OKyX',
      })}
    </>
  );
}
