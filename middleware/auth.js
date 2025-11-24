// const jwt = require("jsonwebtoken");

// const auth = (req, res, next) => {
//   try {
//     console.log("Incoming headers:", req.headers);

//     const authHeader = req.headers["authorization"];
//     if (!authHeader) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const [type, token] = authHeader.split(" ");
//     if (type !== "Bearer" || !token) {
//       return res
//         .status(401)
//         .json({ message: "Token must start with 'Bearer '" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.id };
//     next();
//   } catch (err) {
//     console.error("Auth error:", err.message);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = { auth };

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ message: "Token must start with 'Bearer '" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // store user id
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { auth };
