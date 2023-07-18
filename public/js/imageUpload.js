document.getElementById("imageForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission

  const fileInput = document.getElementById("myFile");
  const file = JSON.stringify(fileInput.files[0]); // Get the selected file

  // const formData = new FormData();
  // formData.append("filename", file); // Append the file to the FormData object

  console.log(file);

  fetch("/upload", {
    method: "POST",
   body: file,
  headers: {'Content-Type': 'multipart/form-data'},
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Log the response from the server
    })
    .catch((error) => {
      console.log('hello world');
      console.error(error); // Log any error that occurred
    });
});