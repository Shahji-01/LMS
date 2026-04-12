import http from "http";

const BASE_URL = "http://localhost:8000/api/v1";

const makeRequest = (path, method = "GET", body = null, token = null, overrideBase = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL((overrideBase || BASE_URL) + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const result = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: result, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data, headers: res.headers });
                }
            });
        });

        req.on("error", reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

async function runTests() {
    const assert = (condition, message) => {
        if (!condition) {
            throw new Error(`Assertion Failed: ${message}`);
        }
    };

    try {
        const healthRes = await makeRequest("/health", "GET", null, null, "http://localhost:8000");
        assert(healthRes.status === 200, `Health endpoint returns 200 OK (Got ${healthRes.status})`);
        assert(healthRes.data?.status === "ok", "Health endpoint returns status: ok");

        const suffix = Date.now();
        const testEmail = `integration_${suffix}@test.com`;
        const signupRes = await makeRequest("/user/signup", "POST", {
            name: "Integration Test Node",
            email: testEmail,
            password: "Password123!",
        });

        assert(signupRes.status === 201, `Signup returns 201 Created (Got ${signupRes.status}. Body: ${JSON.stringify(signupRes.data)})`);
        assert(signupRes.data.status === true || signupRes.data.success === true, `Signup success flag is true (Got ${JSON.stringify(signupRes.data)})`);

        const loginRes = await makeRequest("/user/signin", "POST", {
            email: testEmail,
            password: "Password123!",
        });
        assert(loginRes.status === 200, `Signin returns 200 OK (Got ${loginRes.status}. Body: ${JSON.stringify(loginRes.data)})`);
        assert(loginRes.data.status === true || loginRes.data.success === true, `Signin success flag is true (Got ${JSON.stringify(loginRes.data)})`);

        const cookies = loginRes.headers["set-cookie"];
        assert(cookies && cookies.length > 0, "Signin sets auth cookies");

        const coursesRes = await makeRequest("/course/published?limit=2", "GET");
        assert(coursesRes.status === 200, `Fetch published courses returns 200 OK (Got ${coursesRes.status})`);

        const coursesArray = coursesRes.data?.data?.data || coursesRes.data?.data || coursesRes.data?.courses || [];
        assert(Array.isArray(coursesArray), "Fetch courses returns an array of data");

        console.log("All backend integration assertions passed!");
        process.exit(0);
    } catch (error) {
        console.error("Test execution failed:", error.message);
        process.exit(1);
    }
}

runTests();
