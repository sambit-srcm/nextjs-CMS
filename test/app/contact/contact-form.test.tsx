import { describe, expect, it } from "vitest";

import { aContactPage } from "@/test/fixtures";
import { render, text } from "@/test/render";

import { ContactForm } from "@/app/contact/contact-form";

const copy = aContactPage();

const form = () =>
  render(
    <ContactForm
      submitLabel={copy.submitLabel}
      submittingLabel={copy.submittingLabel}
      successMessage={copy.successMessage}
      errorMessage={copy.errorMessage}
    />,
  );

describe("ContactForm", () => {
  it("renders a labelled, required field for each part of the message", () => {
    const html = form();

    for (const field of ["name", "email", "message"]) {
      expect(html).toContain(`name="${field}"`);
      expect(html).toContain(`for="${field}"`);
      expect(html).toContain(`id="${field}"`);
    }
    expect(html.match(/required/g)).toHaveLength(3);
  });

  it("types the email field so the browser validates before submitting", () => {
    expect(form()).toContain('type="email"');
  });

  it("takes the submit label from the CMS", () => {
    const html = form();

    expect(text(html)).toContain("Send message");
    // `disabled:opacity-50` is a class name, so match the attribute itself.
    expect(html).not.toContain('disabled=""');
  });

  it("keeps the outcome messages out of the idle frame", () => {
    const body = text(form());

    expect(body).not.toContain(copy.successMessage);
    expect(body).not.toContain(copy.errorMessage);
    expect(body).not.toContain(copy.submittingLabel);
  });

  it("limits each field to what the server accepts", () => {
    const html = form();

    expect(html).toContain('maxLength="100"');
    expect(html).toContain('maxLength="254"');
    expect(html).toContain('maxLength="5000"');
  });

  it("shows how many characters the message may use", () => {
    expect(form()).toContain('id="message-count"');
    expect(text(form())).toContain("0 / 5000");
  });

  it("includes a spam trap that people and screen readers never reach", () => {
    const html = form();

    expect(html).toContain('name="website"');
    expect(html).toMatch(/<div aria-hidden="true"[^>]*>[\s\S]*name="website"/);
    expect(html).toMatch(
      /name="website"[^>]*tabindex="-1"|tabindex="-1"[^>]*name="website"/i,
    );
  });
});
