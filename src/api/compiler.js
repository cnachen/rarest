const compile = (files) => {
    return fetch('http://127.0.0.1:3000/api/v1/compiler/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // 确保服务器返回 JSON
      },
      body: JSON.stringify(files)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! 状态码: ${response.status}`);
      }
      return response.json();  // ✅ 正确解析 JSON
    })
    .then(data => {
      console.log('编译成功:', data);  // ✅ 这里才是解析后的 JSON
      return data;
    })
    .catch(error => {
      console.error('编译请求出错:', error);
      throw error;
    });
  };
  
  export { compile };