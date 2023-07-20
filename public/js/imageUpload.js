document.getElementById('profilePicture').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent the default form submission
  if (
    document.getElementById('imageForm').style.display === "none"
    ) {
      document.getElementById('imageForm').style.display=""
    } else {
      document.getElementById('imageForm').style.display="none"
    }
});

document.getElementById("imageForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission

  const fileInput = document.getElementById("myFile");
  const file = fileInput.files[0]; // Get the selected file

  const formData = new FormData();
  formData.append("profile", file); // Append the file to the FormData object

  console.log(formData);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Log the response from the server
      window.location.href = "/dashboard";
    })
    .catch((error) => {
      console.log('hello world');
      console.error(error); // Log any error that occurred
    });
});
