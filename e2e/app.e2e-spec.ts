import { TaalmapClientPage } from './app.po';

describe('taalmap-client App', function() {
  let page: TaalmapClientPage;

  beforeEach(() => {
    page = new TaalmapClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
