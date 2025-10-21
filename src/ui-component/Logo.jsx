import schoolLogo from 'assets/images/smart-school.png';


export default function Logo() {

  return (
    <img
      src={schoolLogo}
      alt="Smart School Logo"
      style={{ height: 30, objectFit: 'contain' }}
    />
  );
}
