/**
 * GOOGLE SHEETS CONNECTION INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Go to "File" > "Share" > "Publish to web".
 * 3. In the "Link" tab:
 *    - Select the tab (e.g., "Inventory") from the first dropdown.
 *    - Select "Comma-separated values (.csv)" from the second dropdown.
 * 4. Click "Publish" and copy that URL.
 * 5. Update the constants below.
 * 
 * NOTE: The app will run in "Demo Mode" with mock data if placeholder URLs are used.
 */

export const GOOGLE_SHEET_CONFIG = {
  INVENTORY_DATA_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTwOGiMzcx_FaF5cFRxIfLjOgXZWdWD4pXSYNZyae5D9NYO8icy6zcHtQnV7IRwpHS6IeiWLNMfOCPc/pub?gid=0&single=true&output=csv',
  MASTER_DETAILS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTwOGiMzcx_FaF5cFRxIfLjOgXZWdWD4pXSYNZyae5D9NYO8icy6zcHtQnV7IRwpHS6IeiWLNMfOCPc/pub?gid=541343396&single=true&output=csv'
};
