document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("js");

    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const navLinks = document.querySelectorAll(".site-nav a");
    const yearTarget = document.getElementById("current-year");
    const revealElements = document.querySelectorAll("[data-reveal]");
    const body = document.body;

    if (navToggle && nav) {
        if (!nav.id) {
            nav.id = "primary-navigation";
        }
        navToggle.setAttribute("aria-controls", nav.id);
        navToggle.setAttribute("aria-expanded", "false");

        const closeNav = () => {
            nav.classList.remove("is-open");
            navToggle.classList.remove("is-active");
            navToggle.setAttribute("aria-expanded", "false");
        };

        navToggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("is-open");
            navToggle.classList.toggle("is-active");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                closeNav();
            });
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            if (!nav.contains(target) && !navToggle.contains(target)) {
                closeNav();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && nav.classList.contains("is-open")) {
                closeNav();
                navToggle.focus();
            }
        });
    }

    if (yearTarget) {
        yearTarget.textContent = new Date().getFullYear();
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
            }
        );

        revealElements.forEach((el) => observer.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add("is-visible"));
    }

    if (body && body.classList.contains("menu-page")) {
        const searchInput = document.getElementById("menu-search");
        const filterButtons = document.querySelectorAll(".menu-chip");
        const categories = document.querySelectorAll(".menu-category");
        const emptyState = document.querySelector(".menu-empty");
        const state = {
            term: "",
            category: "all",
        };

        const normalize = (value) =>
            value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const applyFilters = () => {
            let totalMatches = 0;

            categories.forEach((category) => {
                const matchesCategory =
                    state.category === "all" ||
                    category.dataset.category === state.category;

                let categoryMatches = 0;

                category.querySelectorAll(".menu-item").forEach((item) => {
                    const text = normalize(item.textContent);
                    const matchesSearch = !state.term || text.includes(state.term);
                    const shouldShow = matchesCategory && matchesSearch;

                    item.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        categoryMatches += 1;
                        totalMatches += 1;
                    }
                });

                category.style.display = categoryMatches > 0 ? "" : "none";
            });

            if (emptyState) {
                emptyState.style.display = totalMatches === 0 ? "block" : "none";
            }
        };

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                filterButtons.forEach((btn) => btn.classList.remove("is-active"));
                button.classList.add("is-active");
                state.category = button.dataset.filter || "all";
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                state.term = normalize(searchInput.value.trim());
                applyFilters();
            });
        }

        applyFilters();
    }
});
