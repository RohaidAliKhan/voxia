gsap.registerPlugin(ScrollTrigger);

// Testimonial Slider
const swiper = new Swiper(".swiper", {
  pagination: {
    el: ".swiper-progress",
    type: "progressbar",
  },
  navigation: {
    nextEl: ".slide-button-next",
    prevEl: ".slide-button-prev",
  },
});

// Smooth Scrolling
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  mouseMultiplier: 1,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Sticky Sections
const sections = gsap.utils.toArray(".sticky_section");
sections.forEach((section, i) => {
  gsap.to(section, {
    y: 30,
    scrollTrigger: {
      trigger: section,
      scrub: true,
      start: "bottom bottom",
      pin: true,
      pinSpacing: false,
    },
  });

  // Check if the section is at an even index (alternating sections)
  const isEven = i % 2 === 0;
  ScrollTrigger.create({
    trigger: section,
    start: "top 10%",
    end: "bottom 10%",
    markers: false, // Remove this line in production
    onToggle: ({ isActive }) => {
      if (isActive && isEven) {
        gsap.to(":root", {
          "--base-color-neutral--white-60": "black",
          "--text-color-dark--text-primary": "black",
          "--border-color--border-quarternary": "black",
          "--base-color-neutral--white-24": "rgba(0,0,0,.24)",
        });

        gsap.to(".navbar_logo", { filter: "invert(1)" });
      } else {
        gsap.to(":root", {
          "--base-color-neutral--white-60": "rgba(255,255,255,.6)",
          "--text-color-dark--text-primary": "white",
          "--border-color--border-quarternary": "rgba(255,255,255,.24)",
          "--base-color-neutral--white-24": "rgba(255,255,255,.24)",
        });
        gsap.to(".navbar_logo", { filter: "invert(0)" });
      }
    },
  });
});

// Feature section toggle
const toggleBtn = document.querySelector(".feature_toggle");
const toggleKnob = toggleBtn.querySelector(".feature_knob");
const headings = document.querySelectorAll(".feature_headings");
const tabContents = document.querySelectorAll(".feature_card-wrap");
const tabToggleAnimation = gsap.timeline();
const toggleSwitchAnimation = gsap.timeline({ paused: true });
let headingCurrentIndex = 0;

// Toggle Switch
toggleSwitchAnimation.to(toggleKnob, { xPercent: 79 });
// Stagger cards on tab show
tabToggleAnimation.from(".feature_card", {
  stagger: 0.1,
  autoAlpha: 0,
  x: 30,
  ease: "power4.out",
});

const toggleComboClass = () => {
  headings.forEach((heading, index) => {
    if (index === headingCurrentIndex) {
      heading.classList.toggle("is-text-color");
    } else {
      heading.classList.remove("is-text-color");
    }
  });

  headingCurrentIndex = (headingCurrentIndex + 1) % headings.length;
};
function toggleTabs() {
  tabToggleAnimation.play(0);

  const currentTab = document.querySelector(".feature_card-wrap.active");
  const nextTabId = currentTab.id === "tab1" ? "tab2" : "tab1";
  const nextTab = document.querySelector("#" + nextTabId);

  currentTab.classList.remove("active");
  nextTab.classList.add("active");
}

toggleBtn.addEventListener("click", () => {
  toggleSwitchAnimation.progress() == 1
    ? toggleSwitchAnimation.reverse()
    : toggleSwitchAnimation.play();
  toggleComboClass();
  toggleTabs();
});

(function () {
  const callMeInfoBtn = document.getElementById("call-me-info-btn");
  const callMeBtn = document.getElementById("header-call-me");
  const endCallBtn = document.getElementById("end-call-btn");
  const changeNumberBtn = document.getElementById("change-number-btn");
  const resendBtn = document.getElementById("resend-btn");
  const displayUserNumber = document.querySelectorAll(".display-user-number");
  const closeBtn = document.querySelectorAll(".close_button");

  let user_input = {};
  let evtSource = null;
  let userPhoneNumber = null;
  let call_timer = null;
  let call_timer_interval = null;

  const heroMainCont = document.querySelector(".hero_main");
  const heroConfirmCont = document.querySelector(".hero_confirm");
  const heroVerifyCont = document.querySelector(".hero_verify");
  const heroCallingCont = document.querySelector(".hero_calling-icon");
  const heroChatCont = document.querySelector(".hero_chat");
  const heroCallEndCont = document.querySelector(".hero_call-ended");

  const chatMessagesContainer = document.getElementById(
    "chat-messages-container"
  );
  const callTimerDiv = document.getElementById("call-timer");
  const totalCallTimeDiv = document.getElementById("total-call-time");

  const confirmForm = document.getElementById("wf-form-Hero-AI-Calling-Form");
  const verificationForm = document.getElementById(
    "wf-form-Hero-AI-Verification-Form"
  );

  const callTimerHandler = function () {
    let startTime = new Date().getTime(); // Get current time in milliseconds

    // Function to get the elapsed time since the call started
    let getElapsedTime = function () {
      let currentTime = new Date().getTime();
      let elapsedTime = currentTime - startTime;
      return elapsedTime;
    };

    let formatTime = function (milliseconds) {
      let totalSeconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = totalSeconds % 60;
      return ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
    };

    // Function to stop the timer and get the total elapsed time
    let stopTimer = function () {
      let totalTime = getElapsedTime();
      return formatTime(totalTime);
    };

    // Return the public functions
    return {
      getElapsedTime: getElapsedTime,
      stopTimer: stopTimer,
    };
  };
  const callEndEvt = () => {
    if (evtSource) {
      evtSource.close();
    }

    if (heroChatCont) {
      heroChatCont.classList.add("hide");
    }
    if (heroCallEndCont) {
      heroCallEndCont.classList.remove("hide");
    }

    if (call_timer_interval) {
      clearInterval(call_timer_interval);
    }

    if (call_timer && totalCallTimeDiv) {
      totalCallTimeDiv.innerText = call_timer.stopTimer();
    }
  };

  const verifyApi = async ({ phone }) => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      phoneNumber: phone,
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const res = await fetch(
        "https://api.stage.voxia.ai/public/verification",
        requestOptions
      );

      return res.json();
    } catch (e) {
      return null;
    }
  };

  const callApi = ({ phone, code, name, company = "AI World" }) => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      name: name,
      phoneNumber: phone,
      code: code,
      data: {
        company: company,
      },
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    return new Promise((resolve) => {
      fetch("https://api.stage.voxia.ai/public/call", requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch((error) => console.log("error", error))
        .finally(() => resolve(null));
    });
  };

  const callResEvents = (id) => {
    evtSource = new EventSource(`https://api.stage.voxia.ai/public/call/${id}`);
    evtSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      if (heroCallingCont) {
        heroCallingCont.classList.add("hide");
      }
      if (heroChatCont) {
        heroChatCont.classList.remove("hide");
      }

      if (data.event === "messages") {
        if (!call_timer) {
          call_timer = callTimerHandler();
          call_timer_interval = setInterval(() => {
            // console.log("here the time", call_timer.stopTimer())
            callTimerDiv.innerText = call_timer.stopTimer();
          }, 1000);
        }

        const messages = data.messages;
        // const chat = document.querySelector('.chat');
        const html = messages
          .map((message) => {
            return `<div class="message ${message.role}">${message.content}</div>`;
          })
          .join("");
        chatMessagesContainer.innerHTML = html;
      } else if (data.event === "end") {
        callEndEvt();
      }
    };
  };

  function hideAllContainers() {
    heroConfirmCont.classList.add("hide");
    heroVerifyCont.classList.add("hide");
    heroCallingCont.classList.add("hide");
    heroChatCont.classList.add("hide");
    heroCallEndCont.classList.add("hide");
    heroMainCont.classList.remove("hide");
  }

  endCallBtn.onclick = (e) => {
    e.preventDefault();

    callEndEvt();
  };

  callMeInfoBtn.onclick = (e) => {
    e.preventDefault();

    if (heroMainCont) {
      heroMainCont.classList.add("hide");
    }
    if (heroConfirmCont) {
      heroConfirmCont.classList.remove("hide");
    }
  };

  callMeBtn.onclick = (e) => {
    e.preventDefault();

    if (heroMainCont) {
      heroMainCont.classList.add("hide");
    }
    if (heroConfirmCont) {
      heroConfirmCont.classList.remove("hide");
    }
  };

  confirmForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    userPhoneNumber = formData.get("Phone-Number");

    displayUserNumber.forEach((element) => {
      element.innerHTML = userPhoneNumber;
    });

    for (const [key, value] of formData.entries()) {
      user_input[key] = value;
    }

    const res = await verifyApi({ phone: formData.get("Phone-Number") });

    if (res?.status && res.status === "success") {
      if (heroConfirmCont) {
        heroConfirmCont.classList.add("hide");
      }
      if (heroVerifyCont) {
        heroVerifyCont.classList.remove("hide");
      }
    }
  };

  verificationForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    user_input["Verification-2"] = formData.getAll("Verification-2").join("");

    const { data } = await callApi({
      name: user_input["Name"],
      phone: user_input["Phone-Number"],
      code: user_input["Verification-2"],
    });

    if (data?.id) {
      if (heroVerifyCont) {
        heroVerifyCont.classList.add("hide");
      }
      if (heroCallingCont) {
        heroCallingCont.classList.remove("hide");
      }

      callResEvents(data.id);
    }
  };

  changeNumberBtn.onclick = (e) => {
    e.preventDefault();
    if (heroVerifyCont) {
      heroVerifyCont.classList.add("hide");
    }
    if (heroConfirmCont) {
      heroConfirmCont.classList.remove("hide");
    }
  };

  resendBtn.onclick = async (e) => {
    e.preventDefault();
    const res = await verifyApi({ phone: userPhoneNumber });
    if (res?.status && res.status === "success") {
      resendBtn.classList.add("disbaled");
    }
  };

  closeBtn.forEach((button) => {
    button.addEventListener("click", () => {
      hideAllContainers();
    });
  });
})();