import axios from 'axios';

const URL = 'http://localhost:3200/v1/wallet/spend';
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxY2IyNzU4MC1kNGI4LTQyOWItODlmOC0wNzYxZTlkZmUxNDEiLCJpYXQiOjE3NjY1NTg3ODUsImV4cCI6MTc2OTE1MDc4NX0.uat6km3ZNt4JEMP8wC_4INhWAjOOU8qJOBWkv1J1tHg';

async function testConcurrentSpend() {
  const requests = [];

  for (let i = 0; i < 100; i++) {
    requests.push(
      axios.post(
        URL,
        {
          amount: 1000,
          referenceId: `TEST-${i}-${Date.now()}`
        },
        {
          headers: {
            Authorization: TOKEN,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true // supaya axios tidak throw error
        }
      )
    );
  }

  const results = await Promise.all(requests);

  let success = 0;
  let failed = 0;

  results.forEach(r => {
    if (r.status === 200) success++;
    else failed++;
  });

  console.log('SUCCESS:', success);
  console.log('FAILED:', failed);
}

testConcurrentSpend();
