// Transfer data between screens using JavaScript - לפי ההנחיות
// Available Dogs -> Adoption Request
document.addEventListener("DOMContentLoaded", () => {
  const hiddenDogId = document.getElementById("dog_id");
  const preview = document.getElementById("selectedDogPreview");

  if (!hiddenDogId) return;

  // If the server already provided a dog_id (e.g., via query/render), keep it.
  if (hiddenDogId.value && hiddenDogId.value.trim()) return;

  const raw = sessionStorage.getItem("selectedDog");
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    if (!data || !data.dog_id) return;

    hiddenDogId.value = String(data.dog_id);

    if (preview) {
      preview.style.display = "block";
      preview.textContent = `You are requesting adoption for: ${data.dog_name} (Shelter: ${data.shelter_name})`;
    }
  } catch (e) {
  }
});

const form = document.getElementById("adoptionForm");

function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || "";
}

function setFieldClass(fieldId, isInvalid) {
  const input = document.getElementById(fieldId);
  if (!input) return;

  if (isInvalid) input.classList.add("input-error");
  else input.classList.remove("input-error");
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", (e) => {
  const full_name = document.getElementById("full_name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const dog_id = document.getElementById("dog_id").value.trim();

  // Clear errors
  setErr("err_full_name", "");
  setErr("err_phone", "");
  setErr("err_email", "");

  // Clear dynamic classes
  setFieldClass("full_name", false);
  setFieldClass("phone", false);
  setFieldClass("email", false);

  let ok = true;

  // Required fields
  if (!dog_id) ok = false; // error will be handled on the server side

  if (!full_name) {
    setErr("err_full_name", "Full name is required.");
    setFieldClass("full_name", true);
    ok = false;
  }

  if (!phone) {
    setErr("err_phone", "Phone number is required.");
    setFieldClass("phone", true);
    ok = false;
  }

  if (!email) {
    setErr("err_email", "Email is required.");
    setFieldClass("email", true);
    ok = false;
  }

  // Name must not contain numbers
  if (full_name && /\d/.test(full_name)) {
    setErr("err_full_name", "Name cannot contain numbers.");
    setFieldClass("full_name", true);
    ok = false;
  }

  // Phone validation 
  if (phone) {
    // 1. Only digits (reject letters/spaces/dashes)
    if (!/^\d+$/.test(phone)) {
      setErr("err_phone", "Phone number must contain digits only.");
      setFieldClass("phone", true);
      ok = false;
    }
    // 2. Length check
    else if (phone.length < 9 || phone.length > 11) {
      setErr("err_phone", "Phone number length is invalid.");
      setFieldClass("phone", true);
      ok = false;
    }
    // 3. Israeli phone format check (starts with 05)
    else if (!/^05\d{8,10}$/.test(phone)) {
      setErr("err_phone", "Invalid phone number format.");
      setFieldClass("phone", true);
      ok = false;
    }
  }

  // Email validation
  if (email && !isEmailValid(email)) {
    setErr("err_email", "Invalid email format.");
    setFieldClass("email", true);
    ok = false;
  }

  if (!ok) e.preventDefault();
});