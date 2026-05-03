const axios = require('axios');

async function testApi() {
  try {
    const userId = 'fd72037a-f45e-4a66-b5c1-c5d566b9c78f'; // Rakesh's ID
    const res = await axios.get(`http://localhost:5000/api/v1/admin/posts?userId=${userId}`);
    console.log('Posts count for user:', res.data.data.posts.length);
    console.log('All posts match userId:', res.data.data.posts.every(p => p.authorId === userId));
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testApi();
