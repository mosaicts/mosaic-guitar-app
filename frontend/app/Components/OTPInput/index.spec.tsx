import { createRoutesStub } from 'react-router';
import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OTPInput from './';

const fn = vi.fn();
const OTPPinBlock = () => <OTPInput length={6} onComplete={fn} />;

describe('<OTPInput />', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    const Stub = createRoutesStub([
      {
        path: '/password-reset/verify-otp',
        Component: OTPPinBlock
      }
    ]);
    // render the app stub at "/login"
    render(<Stub initialEntries={['/password-reset/verify-otp']} />);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should find six enabled pin inputs', async () => {
    // find the elements
    const pinInputs = screen.getAllByRole('textbox');
    expect(pinInputs).toHaveLength(6);
    pinInputs.forEach((input) => {
      expect(input).toBeEnabled();
      expect(input).toHaveValue('');
    });
  });

  it('should focus on the next input if the current input is filled except the last one', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    await user.type(pinInputs[0], '1');
    expect(pinInputs[0]).toHaveValue('1');
    expect(pinInputs[1]).toBe(document.activeElement);

    await user.type(pinInputs[1], '2');
    expect(pinInputs[1]).toHaveValue('2');
    expect(pinInputs[2]).toBe(document.activeElement);

    await user.type(pinInputs[5], '3');
    expect(pinInputs[5]).toHaveValue('3');
    expect(pinInputs[5]).toBe(document.activeElement);
  });

  it('should only input single digit', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    await user.type(pinInputs[0], 'a');
    expect(pinInputs[0]).toHaveValue('');

    await user.type(pinInputs[2], '123');
    expect(pinInputs[2]).toHaveValue('1');

    await user.type(pinInputs[5], ')');
    expect(pinInputs[5]).toHaveValue('');
  });

  it('should empty and focus on the current input if the current input value is not empty when user hit Backspace', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    expect(pinInputs[5]).toHaveValue('6');
    await user.click(pinInputs[5]);
    await user.keyboard('{Backspace}');
    expect(pinInputs[5]).toHaveValue('');
    expect(pinInputs[5]).toBe(document.activeElement);
    expect(pinInputs[4]).toHaveValue('5');
  });

  it('should empty and focus on the previous input if the current input value is empty except the first one when user hit Backspace', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    await user.click(pinInputs[5]);
    await user.keyboard('{Backspace}');
    expect(pinInputs[4]).toHaveValue('5');

    await user.keyboard('{Backspace}');
    expect(pinInputs[4]).toHaveValue('');
    expect(pinInputs[4]).toBe(document.activeElement);
    expect(pinInputs[3]).toHaveValue('4');

    // try with first input
    expect(pinInputs[0]).toHaveValue('1');
    await user.click(pinInputs[0]);
    await user.keyboard('{Backspace}');
    expect(pinInputs[0]).toHaveValue('');
    expect(pinInputs[0]).toBe(document.activeElement);

    // backspace 1 more
    await user.keyboard('{Backspace}');
    expect(pinInputs[0]).toHaveValue('');
    expect(pinInputs[0]).toBe(document.activeElement);
  });

  it('should fill each input with each single digit respectively when user paste the input from clipboard ', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    await navigator.clipboard.writeText('134');
    await user.click(pinInputs[1]);
    // await user.keyboard('{Control>}V{/Control}');
    await user.paste();
    expect(pinInputs[1]).toHaveValue('1');
    expect(pinInputs[2]).toHaveValue('3');
    expect(pinInputs[3]).toHaveValue('4');
  });

  it('should overwrite current inputs with new inputs when user types new inputs while keeping the following inputs unchanged', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 2; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    await user.type(pinInputs[0], '2');
    expect(pinInputs[0]).toHaveValue('2');
    await user.type(pinInputs[1], '5');
    expect(pinInputs[1]).toHaveValue('5');

    // expect following input to be unchanged
    expect(pinInputs[2]).toHaveValue('');
  });

  it('should overwrite current inputs with new inputs when user paste the input from clipboard ', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    await user.click(pinInputs[1]);
    await user.paste('134');
    expect(pinInputs[1]).toHaveValue('1');
    expect(pinInputs[2]).toHaveValue('3');
    expect(pinInputs[3]).toHaveValue('4');

    // remaining inputs do not change
    expect(pinInputs[0]).toHaveValue('1');
    expect(pinInputs[4]).toHaveValue('5');
    expect(pinInputs[5]).toHaveValue('6');
  });

  it('should overwrite current complete inputs (6 digits) with new inputs when user paste the inputs from clipboard ', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    await user.click(pinInputs[1]);
    await user.paste('134');
    expect(pinInputs[1]).toHaveValue('1');
    expect(pinInputs[2]).toHaveValue('3');
    expect(pinInputs[3]).toHaveValue('4');

    // remaining inputs do not change
    expect(pinInputs[0]).toHaveValue('1');
    expect(pinInputs[4]).toHaveValue('5');
    expect(pinInputs[5]).toHaveValue('6');
  });

  it('should call complete function when user types all the inputs', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    pinInputs.forEach((input, index) => {
      expect(input).toHaveValue(index + 1 + '');
    });
    expect(fn).toHaveBeenCalledWith('123456');
  });

  it('should call complete function when user pastes input of 6 digits', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    await user.click(pinInputs[0]);
    await user.paste('123456');

    pinInputs.forEach((input, index) => {
      expect(input).toHaveValue(index + 1 + '');
    });
    expect(fn).toHaveBeenCalledWith('123456');
  });

  it('should not call complete function when user pastes input of < 6 digits', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    await user.click(pinInputs[0]);
    await user.paste('12345');

    pinInputs.forEach((input, index) => {
      if (index === 5) {
        expect(input).toHaveValue('');
      } else {
        expect(input).toHaveValue(index + 1 + '');
      }
    });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should call complete function when user pastes input of > 6 digits', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    await user.click(pinInputs[0]);
    await user.paste('1234567');

    pinInputs.forEach((input, index) => {
      expect(input).toHaveValue(index + 1 + '');
    });
    expect(fn).toHaveBeenCalledWith('123456');
  });

  it('should call complete function when user pastes new input of 6 digits after typing all the inputs', async () => {
    let pinInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < pinInputs.length; ++i) {
      await user.type(pinInputs[i], i + 1 + '');
    }

    await user.click(pinInputs[0]);
    await user.paste('789012');
    expect(fn).toHaveBeenCalledWith('789012');
  });
});
