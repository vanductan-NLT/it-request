export const ENV = (() => {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
  else if (/Edg\//.test(ua)) browser = 'Edge';

  let os = 'Unknown';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Linux/.test(ua)) os = 'Linux';

  return {
    browser,
    os,
    screen: `${screen.width}x${screen.height}`,
  };
})();
