import { DdMmYyyyHHMMDatePipe } from './dd-mm-yyyy-hh-mm-date.pipe';

describe('DdMmYyyyHHMMDatePipe', () => {
  it('create an instance', () => {
    const pipe = new DdMmYyyyHHMMDatePipe("");
    expect(pipe).toBeTruthy();
  });
});
