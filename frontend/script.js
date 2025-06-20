// async function connect() {
//     if (typeof window.ethereum !== 'undefined') {
//         console.log('MetaMask detected ... Proceeding to connect.');
//         try {
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
//             console.log('Connected accounts:', accounts);
//             document.getElementById("connectButton").innerHTML = "Connected: " + accounts[0];
//         } catch (error) {
//             console.error('Error connecting to MetaMask:', error);
//             document.getElementById("connectButton").innerHTML = "Connection Failed";
//         }
//     } else {
//         console.log('Metamask not detected. Please install it to connect.');
//         document.getElementById("connectButton").innerHTML = "Please Install Metamask!!";
//     }
// }

// const btn = document.getElementById("toggle-btn");
// const panel = document.getElementById("toggle-panel");

// btn.addEventListener("click", () => {
//   const expanded = btn.getAttribute("aria-expanded") === "true";
//   btn.setAttribute("aria-expanded", String(!expanded));
//   btn.setAttribute(
//     "aria-label",
//     expanded ? "Open more info" : "Close more info"
//   );
//   if (expanded) {
//     panel.setAttribute("hidden", "");
//   } else {
//     panel.removeAttribute("hidden");
//   }
// });

window.addEventListener("beforeunload", () => {
  sessionStorage.setItem("scrollPos", window.scrollY);
});

document.addEventListener("DOMContentLoaded", () => {
  const scrollPos = sessionStorage.getItem("scrollPos");
  if (scrollPos) {
    window.scrollTo(0, parseInt(scrollPos));
    sessionStorage.removeItem("scrollPos"); // Remove it after restoring to prevent issues on subsequent visits
  }
});
