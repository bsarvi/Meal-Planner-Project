export function addToast(toastType, toastMessage) {
  const toastBody = generateToast(toastType, toastMessage);
  const toastsContainer = document.getElementById("toastsContainer");
  toastsContainer.prepend(toastBody);
}

function generateToast(toastType, toastMessage) {
  const toastBody = document.createElement("div");
  const toastPara = document.createElement("p");
  toastPara.textContent = toastMessage;
  toastBody.appendChild(toastPara);
  toastBody.classList.add("toast");
  toastBody.classList.add(`${toastType}Toast`);

  const closeToastBtn = document.createElement("span");
  closeToastBtn.innerHTML = '<i class="fa-solid fa-x"></i>';
  closeToastBtn.classList.add("closeToastBtn");
  toastBody.appendChild(closeToastBtn);

  let toastId;

  const closeToast = () => {
    toastBody.style.transform = "translateX(-110%)";
    setTimeout(() => {
      toastBody.remove();
    }, 500); // You can adjust the duration of the slide-out animation here
  };

  closeToastBtn.addEventListener("click", () => {
    clearTimeout(toastId);
    closeToast();
  });

  toastId = setTimeout(() => {
    closeToast();
  }, 3000); // Adjust the toast display duration here

  setTimeout(() => {
    toastBody.style.transform = "translateX(0)";
  }, 100);

  return toastBody;
}
