import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ToastProvider, useToast } from "./index";

describe("ToastContext", () => {
  it("throws an error when useToast is called outside of ToastProvider", () => {
    function TestComponent() {
      useToast();
      return null;
    }
    expect(() => renderToString(<TestComponent />)).toThrow(
      "useToast must be used within a ToastProvider",
    );
  });

  it("renders children correctly inside ToastProvider", () => {
    const html = renderToString(
      <ToastProvider>
        <div>Hello Scopa</div>
      </ToastProvider>,
    );
    expect(html).toContain("Hello Scopa");
  });
});
