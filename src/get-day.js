export const getDay = () => {
  const day = new Date();
  const options = {
    weekday: 'long'
  };
  return day.toLocaleDateString('en-US', options);
}