import moment from 'moment';

const pi = Math.PI;
const pow = Math.pow;
const sin = Math.sin;
const cos = Math.cos;
const asin = Math.asin;
const acos = Math.acos;
const atan = Math.atan;

const epsilon = pi * 23.43759 / 180;
const e = 0.0167032;
const w = 2*pi/23.9344696*24; // earth angular velocity
const lRef = 106.3; // degrees longitude east of meridian
const tRef = 78.46; // days since Jan.1 2013 with fraction being hours, minutes, seconds etc.
const refDate = moment('2013-01-01 00:00:00');

const t0 = (l) => {
    return tRef - (l-lRef)/w * pi/180;
};

const M = (d) => {
  return (356.666444 + 0.98560028 * (d + 1)) * pi/180;
};

const Ce = (d) => {
  return (2*e - 3/12*pow(e, 3)) * sin(M(d)) + 5/4*pow(e, 2) * sin(2*M(d)) + 3/12*pow(e, 3) * sin(3*M(d));
};

const phi = (d) => {
  return M(d) + Ce(d) - (360 - 283.161)/180*pi;
};

const theta = (d) => {
  return acos(sin(epsilon) * sin(phi(d)));
};

const x = (L, l, t) => {
  return cos(w*(t - t0(l))) * cos(phi(t)) + sin(w*(t - t0(l))) * cos(epsilon) * sin(phi(t));
};

const y = (L, l, t) => {
  return -sin(pi*L/180) * sin(w*(t-t0(l))) * cos(phi(t)) + sin(pi*L/180) * cos(w*(t-t0(l))) * cos(epsilon) * sin(phi(t)) - cos(pi*L/180) * sin(epsilon) * sin(phi(t));
};

const zenith = (L, l, t) => {
  return pi/2 - asin(-cos(pi*L/180) * sin(w*(t-t0(l))) * cos(phi(t)) + cos(pi*L/180) * cos(w*(t-t0(l))) * cos(epsilon) * sin(phi(t)) + sin(pi*L/180) * sin(epsilon) * sin(phi(t)));
};

const azimuth = (L, l, t) => {
  if (x(L, l, t) < 0) {
    return 3*pi/2 - pi - atan(y(L, l, t) / x(L, l, t));
  }
  if (y(L, l, t) > 0) {
    return 3*pi/2 - atan(y(L, l, t) / x(L, l, t));
  }
  return 3*pi/2 - 2*pi - atan(y(L, l, t) / x(L, l, t));
};

export const solarAngles = (lon, lat, dateTime) => {
  let deltaDays = dateTime.diff(refDate, 'days', true);
  return {
    azimuth: azimuth(lat, lon, deltaDays) * 180/pi,
    zenith: zenith(lat, lon, deltaDays) * 180/pi
  };
};
