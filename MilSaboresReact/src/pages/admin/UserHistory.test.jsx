import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import UserHistory from "./UserHistory.jsx";

describe("UserHistory", () => {
  it("TAUE-Admin 38: muestra el aviso cuando falta el identificador del usuario", () => {
    render(
      <MemoryRouter>
        <UserHistory />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Falta el identificador del usuario\./i)
    ).toBeInTheDocument();
  });
});
