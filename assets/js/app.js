import { store } from "./store.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. DOM Elements
  const filterButtons = document.querySelectorAll(".project-filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const contactForm = document.getElementById("contact-form");
  const toastNotification = document.getElementById("toast-notification");

  // 2. Subscribe to State Changes (Reactive UI updates)
  store.subscribe((state) => {
    if (filterButtons.length) {
      filterButtons.forEach((btn) => {
        const category = btn.dataset.filter;
        if (category === state.activeFilter) {
          btn.classList.add("bg-orange-500", "text-white");
          btn.classList.remove("bg-gray-800", "text-gray-300");
        } else {
          btn.classList.remove("bg-orange-500", "text-white");
          btn.classList.add("bg-gray-800", "text-gray-300");
        }
      });
    }

    if (projectCards.length) {
      projectCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        if (state.activeFilter === "all" || cardCategory === state.activeFilter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    }

    if (state.formSuccess && toastNotification) {
      toastNotification.classList.remove("hidden");
      setTimeout(() => {
        store.setState({ formSuccess: false });
        toastNotification.classList.add("hidden");
      }, 4000);
    }
  });

  // 3. Event Listeners for State Mutators
  if (filterButtons.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const selectedButton = e.currentTarget;
        const selectedCategory = selectedButton?.dataset?.filter;

        if (selectedCategory) {
          store.setState({ activeFilter: selectedCategory });
        }
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      store.setState({ formSubmitting: true });

      setTimeout(() => {
        store.setState({ formSubmitting: false, formSuccess: true });
        contactForm.reset();
      }, 1000);
    });
  }
});
