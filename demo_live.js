const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
    const baseUrl = 'http://localhost:3000';

    console.log('🚀 Starting TruthLens AI Backend Demo (Node 14 Safe)...\n');

    // 1. Health Check
    try {
        console.log('📡 Checking Health...');
        const health = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health:', health.data);
    } catch (e) {
        console.error('❌ Server not responding. Is it running?', e.message);
        return;
    }

    await delay(1000);

    // 2. Register
    console.log('\n📝 Registering User...');
    const email = `demo_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        const regRes = await axios.post(`${baseUrl}/auth/register`, { email, password });
        console.log('✅ Register Status:', regRes.status, regRes.data);
    } catch (e) {
        console.log('Info: Register might check specific duplicate', e.response ? e.response.data : e.message);
    }

    await delay(1000);

    // 3. Login
    console.log('\n🔑 Logging In...');
    let token;
    try {
        const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password });
        console.log('✅ Login Success. Access Token received.');
        token = loginRes.data.data?.accessToken;
    } catch (e) {
        console.error('❌ Login Failed', e.response ? e.response.data : e.message);
        return;
    }

    if (!token) {
        console.error('❌ No token received');
        return;
    }

    await delay(1000);

    // 4. Create Post
    console.log('\n📝 Creating a Post...');
    try {
        const postRes = await axios.post(`${baseUrl}/posts`,
            { title: 'My First Verification', content: 'Checking if this fact is true...' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Create Post:', postRes.data);
    } catch (e) {
        console.error('❌ Post Failed', e.response ? e.response.data : e.message);
    }

    await delay(1000);

    // 5. Scrape (Polite)
    console.log('\n🕷️ Testing Polite Scraper (example.com)...');
    try {
        const scrapeRes = await axios.post(`${baseUrl}/api/scrape`,
            { url: 'http://example.com' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Scraper Result:', scrapeRes.data);
    } catch (e) {
        console.error('❌ Scrape Failed', e.response ? e.response.data : e.message);
    }

    console.log('\n✨ Demo Complete!');
}

runDemo();
