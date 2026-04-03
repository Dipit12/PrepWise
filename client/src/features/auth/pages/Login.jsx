import "../authForm.scss";

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <main>
        <div className="form-container">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="button-primary-btn">
              Login
            </button>
          </form>
          <p>
            Dont have an Account? <a href="/register">Register</a>
          </p>
        </div>
      </main>
    </>
  );
};

export default Login;
