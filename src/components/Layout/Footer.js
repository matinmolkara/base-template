import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>My App</h5>
            <p>Your awesome web application</p>
          </Col>
          <Col md={6}>
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link href="/" className="text-light">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-light">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-light">
                  Contact
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center">
            <p>&copy; 2024 My App. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
