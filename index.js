document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
        document
            .querySelectorAll(".tab")
            .forEach((t) => t.classList.remove("active"));

        this.classList.add("active");

        const tabBg = document.querySelector(".tab-bg");
        tabBg.style.left = this.offsetLeft + "px";
        tabBg.style.width = this.offsetWidth + "px";
    });
});

document
    .querySelector(".password-toggle")
    .addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        const type =
            passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        const eyeIcon = this.querySelector("i");
        if (type === "text") {
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
        } else {
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    });