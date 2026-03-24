async function testApi() {
  const res = await fetch("http://localhost:3000/api/messages?lat=8.9637&lng=125.346&radius=65000");
  const data = await res.json();
  console.log("Total messages:", data.length);
  if (data.length > 0) {
    console.log("First message keys:", Object.keys(data[0]));
    console.log("First message preview:", data[0]);
  }
}
testApi();
