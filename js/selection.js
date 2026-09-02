const decks = document.querySelectorAll("li")

const search = document.querySelector("input");

search.addEventListener("input", () => {
  console.log("typed")
  decks.forEach((entry) => {
    if (!entry.innerText.includes(search.value)) {
      entry.setAttribute("hidden","");
    } else {
      entry.removeAttribute("hidden");
    }
  });
})
