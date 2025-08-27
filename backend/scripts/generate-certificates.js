const mkcert = require('mkcert');
const fs = require('fs');
const path = require('path');

async function generateCertificates() {
  console.log('Generating SSL certificates for local development...');
  
  // Create certs directory if it doesn't exist
  const certsDir = path.join(__dirname, '../certs');
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }

  // Create a CA
  const ca = await mkcert.createCA({
    organization: 'Instagram Token Manager Development CA',
    countryCode: 'BR',
    state: 'Development',
    locality: 'Local',
    validityDays: 365
  });

  // Create a certificate
  const cert = await mkcert.createCert({
    domains: ['localhost', '127.0.0.1'],
    validityDays: 365,
    caKey: ca.key,
    caCert: ca.cert
  });

  // Write the certificates to disk
  fs.writeFileSync(path.join(certsDir, 'ca.key'), ca.key);
  fs.writeFileSync(path.join(certsDir, 'ca.cert'), ca.cert);
  fs.writeFileSync(path.join(certsDir, 'cert.key'), cert.key);
  fs.writeFileSync(path.join(certsDir, 'cert.crt'), cert.cert);

  console.log('SSL certificates generated successfully.');
  console.log('Location:', certsDir);
  console.log('\nNote: For local development, you should add this CA to your trusted roots.');
  console.log('On Windows, double-click the ca.cert file and install it to Trusted Root Certification Authorities.');
}

generateCertificates().catch(console.error);
