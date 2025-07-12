import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<Button loading={true}>Click me</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading={true}>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
