import { loginUser, registerUser } from './services';
import { Request, Response } from 'express';
import { LoginRequest, SignupRequest } from './types';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.utils';
import { handleError, handleResponse } from '../../utils/responseHandling.utils';

export const register = async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    if (!user) {
      handleResponse(res, 400, 'User registration failed');
      return;
    }
    // Generate Access Token
    const token = generateAccessToken({ id: user.id });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Generate Refresh Token
    const refreshToken = generateRefreshToken({ id: user.id });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    handleResponse(res, 200, 'User registered successfully', user);
  } catch (error) {
    // Check for specific error messages
    if ((error as Error).message === 'Email already exists') {
      handleError(res, 400, 'Email already exists', error as Error);
    } else {
      handleError(res, 500, 'Error registering user', error as Error);
    }
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    if (!user) {
      handleResponse(res, 400, 'User login failed');
      return;
    }
    // Generate Access Token
    const token = generateAccessToken({ id: user.id });
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Generate Refresh Token
    const refreshToken = generateRefreshToken({ id: user.id });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    handleResponse(res, 200, 'User registered successfully', user);
  } catch (error) {
    handleError(res, 400, 'Incorrect Credentials', error as Error);
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

  if (!refreshToken) {
    handleResponse(res, 401, 'Refresh token is missing');
    return;
  }

  try {
    // Verify the refresh token
    const decoded = verifyToken(refreshToken) as { id: string };

    // Generate a new access token
    const newAccessToken = generateAccessToken({ id: decoded.id });
    res.cookie('authToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    handleResponse(res, 200, 'Access token refreshed successfully');
  } catch (error) {
    handleError(res, 403, 'Invalid or expired refresh token', error as Error);
  }
};

export const checkAuthentication = (req: Request, res: Response): void => {
  const authToken = req.cookies.authToken; // Get auth token from cookies
  const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

  // Check if auth token exists
  if (authToken) {
    try {
      // Verify the auth token
      const decoded = verifyToken(authToken) as { id: string };
      if (!decoded || !decoded.id) {
        handleResponse(res, 401, 'User is not authenticated/logged in');
        return;
      }
      handleResponse(res, 200, 'User is authenticated');
      return;
    } catch (error) {
      handleError(res, 401, 'User is not authenticated/logged in', error as Error);
      return;
    }
  }

  // If no valid auth token, check the refresh token
  if (!refreshToken) {
    handleResponse(res, 401, 'User is not authenticated/logged in');
    return;
  }

  try {
    // Verify the refresh token
    const decoded = verifyToken(refreshToken) as { id: string };
    if (!decoded || !decoded.id) {
      handleResponse(res, 401, 'User is not authenticated/logged in');
      return;
    }
    handleResponse(res, 200, 'User is authenticated');
  } catch (error) {
    handleError(res, 401, 'User is not authenticated/logged in', error as Error);
  }
};
