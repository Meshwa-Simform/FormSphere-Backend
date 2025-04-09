import bcrypt from 'bcrypt';
import prisma from '../../configs/db.config';

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUSer = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existingUSer) {
    throw new Error('Email already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new Error('Incorrect Credentials');
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Incorrect Credentials');
  }
  return user;
};
