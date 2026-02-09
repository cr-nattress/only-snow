const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) { console.log('Missing Redis credentials'); process.exit(1); }

async function delKey(key: string) {
  const res = await fetch(`${url}/del/${key}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  console.log(`DEL ${key}:`, JSON.stringify(data));
}

async function main() {
  await delKey('onlysnow:regions:all');
  await delKey('onlysnow:chase-alerts');
  console.log('Cache cleared!');
  process.exit(0);
}
main();
