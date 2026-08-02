import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../context/AuthProvider';
import { ApiError, api } from '../lib/api';
import Login from './Login';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual('../lib/api');
  return {
    ...actual,
    api: {
      me: vi.fn(),
      login: vi.fn(),
    },
  };
});

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/autentificare']}>
      <AuthProvider>
        <Routes>
          <Route path="/autentificare" element={<Login />} />
          <Route path="/flota" element={<h1>Flota</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function submit(user, username, password) {
  await user.type(screen.getByLabelText(/utilizator/i), username);
  await user.type(screen.getByLabelText(/parola/i), password);
  await user.click(screen.getByRole('button', { name: /intra in cont/i }));
}

describe('Login', () => {
  beforeEach(() => {
    api.me.mockResolvedValue({ user: null });
  });

  it('keeps the user on the login page when the credentials are rejected', async () => {
    // This is the regression that mattered most: the original handler ignored
    // the response and redirected to the booking page even on a 401.
    api.login.mockRejectedValue(
      new ApiError('Invalid username or password.', { status: 401 }),
    );

    const user = userEvent.setup();
    renderLogin();
    await submit(user, 'testuser', 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(screen.queryByRole('heading', { name: 'Flota' })).not.toBeInTheDocument();
  });

  it('navigates on a successful sign in', async () => {
    api.login.mockResolvedValue({ user: { id: 1, username: 'testuser', isAdmin: false } });

    const user = userEvent.setup();
    renderLogin();
    await submit(user, 'testuser', 'correct-horse-1');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Flota' })).toBeInTheDocument();
    });
  });

  it('surfaces a connection failure instead of failing silently', async () => {
    api.login.mockRejectedValue(new ApiError('Nu putem contacta serverul.', { status: 0 }));

    const user = userEvent.setup();
    renderLogin();
    await submit(user, 'testuser', 'correct-horse-1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Nu putem contacta serverul.');
  });

  it('does not submit the form more than once per click', async () => {
    api.login.mockResolvedValue({ user: { id: 1, username: 'testuser', isAdmin: false } });

    const user = userEvent.setup();
    renderLogin();
    await submit(user, 'testuser', 'correct-horse-1');

    await waitFor(() => expect(api.login).toHaveBeenCalledTimes(1));
  });
});
