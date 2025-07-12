import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthForm from "@/components/auth/AuthForm";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

describe("AuthForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form by default", () => {
    render(<AuthForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("switches to signup mode", () => {
    render(<AuthForm />);

    const switchButton = screen.getByText(/don't have an account/i);
    fireEvent.click(switchButton);

    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("submits form with valid data", async () => {
    const mockSignIn = jest
      .fn()
      .mockResolvedValue({ data: { user: {} }, error: null });
    require("@/lib/supabase").supabase.auth.signInWithPassword = mockSignIn;

    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});

