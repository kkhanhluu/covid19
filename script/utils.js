export async function request(URL) {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
