router.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"PrimeCapital" <${process.env.FROM_EMAIL}>`,
      to: "YOUR_EMAIL@gmail.com",
      subject: "Test Mail",
      html: "<h1>Email working ✅</h1>",
    });

    res.send("Mail sent ✅");
  } catch (err) {
    console.log("MAIL ERROR ❌", err);
    res.status(500).send(err.message);
  }
});
