import { Mail } from "lucide-react";
import { useState } from "react";

type ContactFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
};

const CONTACT_EMAIL = "hello@stressoutadvertising.com";

export function ContactStage() {
  const [formState, setFormState] = useState<ContactFormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");

  function updateField<Key extends keyof ContactFormState>(field: Key, value: ContactFormState[Key]) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `New inquiry from ${formState.name}`;
    const body = [
      `Name: ${formState.name}`,
      `Company: ${formState.company || "Not provided"}`,
      `Email: ${formState.email}`,
      `Phone: ${formState.phone || "Not provided"}`,
      "",
      "Message:",
      formState.message,
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatusMessage(`Your email app should open now. If it doesn't, write to ${CONTACT_EMAIL}.`);
  }

  return (
    <div className="stage-layout stage-layout--contact contact-stage">
      <div className="stage-copy contact-stage__copy">
        <h2 className="stage-title contact-stage__title">Connect with Our Team</h2>
        <img
          className="contact-stage__logo"
          src="/assets/stressed-out/images/logo-3.png"
          alt="Stressed Out logo"
        />
      </div>

      <div className="contact-form-shell">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-form__field">
            <span className="sr-only">Name</span>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="contact-form__field">
            <span className="sr-only">Company Name (optional)</span>
            <input
              type="text"
              name="company"
              placeholder="Company Name (optional)"
              value={formState.company}
              onChange={(event) => updateField("company", event.target.value)}
              autoComplete="organization"
            />
          </label>

          <label className="contact-form__field">
            <span className="sr-only">Email</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="contact-form__field">
            <span className="sr-only">Phone Number (optional)</span>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (optional)"
              value={formState.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
            />
          </label>

          <label className="contact-form__field contact-form__field--message">
            <span className="sr-only">Message</span>
            <textarea
              name="message"
              placeholder="Message"
              value={formState.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={5}
              required
            />
          </label>

          <div className="contact-form__actions">
            <button type="submit" className="contact-form__submit glass-button glass-button--primary">
              <span>Submit</span>
              <Mail size={18} strokeWidth={2} />
            </button>
            {statusMessage ? <p className="contact-form__helper">{statusMessage}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
