import LinkPicker from '..';
import {render} from '@testing-library/react';

describe('link picker', () => {
  test('basic', () => {
    const result = render(<LinkPicker/>);
    expect(result.container.innerHTML).toMatchSnapshot();
  });
});
