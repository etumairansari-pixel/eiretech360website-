const loadClient = () => {
  void import("./client");
};

const isMobile = window.matchMedia("(max-width: 767px)").matches;
const isHomePath = window.location.pathname === "/" || window.location.pathname === "/index.html";

if (isMobile && isHomePath) {
  window.setTimeout(loadClient, 1600);
} else {
  loadClient();
}
