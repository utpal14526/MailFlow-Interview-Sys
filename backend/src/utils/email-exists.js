import emailExistence from "email-existence";

export function checkEmailExists(email) {
  return new Promise((resolve) => {
    emailExistence.check(email, (err, res) => {
      if (err) return resolve(false);
      resolve(res);
    });
  });
}
