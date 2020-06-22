import React, { useState, useCallback } from "react";
import debounce from "lodash/debounce";
import styled, { createGlobalStyle } from "styled-components";
import moment from "moment";
import SearchBox from "./components/SearchBox";
import Loading from "./components/loading";

const GlobalStyle = createGlobalStyle`
  body {
    
    min-height: 100vh;
    margin: 0;
background-color: #fffcfc;
background-image: url("https://www.transparenttextures.com/patterns/absurdity.png");
/* This is mostly intended for prototyping; please download the pattern and re-host for production environments. Thank you! */

  }
`;

function App() {
  const token = process.env.REACT_APP_GITHUB_API_TOKEN;
  const [state, setState] = useState({
    text: "",
    results: [],
    repos: [],
    loading: false,
  });

  const { text, results, loading, repos } = state;

  const [clear, setClear] = useState(false);

  async function getUser(name) {
    let response = await fetch(`https://api.github.com/users/${name}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    let data = await response.json();
    return data;
  }

  async function getUserRepos(name) {
    let response = await fetch(`https://api.github.com/users/${name}/repos`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    let data = await response.json();
    return data;
  }

  const updateText = (text) => {
    setState((prevState) => ({ ...prevState, text }));
  };

  const clearResults = () => {
    setState((prevState) => ({
      ...prevState,
      results: [],
      repos: [],
    }));
    setClear(true);
  };

  const search = async (text) => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));

    const githubUser = await getUser(text);
    setState((prevState) => ({
      ...prevState,
      results: githubUser,
    }));

    const userRepos = await getUserRepos(text);
    setState((prevState) => ({
      ...prevState,
      repos: userRepos,
    }));

    setTimeout(function () {
      setState((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }, 1500);
  };
  console.log(clear);

  const debouncedSearch = useCallback(
    debounce((text) => search(text), 500),
    []
  );

  return (
    <Wrapper>
      <Header>GitHub User Lookup!</Header>
      <SearchBox
        text={text}
        updateText={updateText}
        debouncedSearch={debouncedSearch}
        clearResults={clearResults}
      />
      <GlobalStyle />

      {loading && <Loading />}
      {!loading && !results.login && (
        <div
          style={{ margin: "0 auto", width: "fit-content", fontSize: "24px" }}
        >
          No Results
        </div>
      )}

      {!loading && results.login && (
        <Profile>
          <UserImg src={results.avatar_url} alt={results.login} />
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "bold" }}>
              <a
                href={results.html_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {results.login}
              </a>
            </h1>
            Public Repos {results.public_repos}
          </div>
        </Profile>
      )}
      <Results>
        {!loading &&
          repos.length > 0 &&
          repos
            .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
            .map((repo) => {
              var date = moment(repo.updated_at);
              var dateComponent = date.utc().format("YYYY-MM-DD");

              return (
                <Repo>
                  <RepoTitle href={repo.html_url}>{repo.name}</RepoTitle>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: "10px 0 0",
                    }}
                  >
                    <div>{repo.language}</div>
                    <date>{dateComponent}</date>
                  </div>
                </Repo>
              );
            })}
      </Results>
    </Wrapper>
  );
}

export default App;

const UserImg = styled.img`
  border-radius: 50%;
  max-width: 150px;
  width: 100%;
`;

const Header = styled.h1`
  margin: 20px auto;
  width: fit-content;
  background-color: #fff;
  padding: 10px 15px;
  border: 3px solid #000;
`;

const Profile = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: 20px auto;
  width: 60%;
`;

const Wrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`;

const Results = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
`;

const Repo = styled.div`
  display: inline-block;
  max-width: 300px;
  width: 100%;
  height: 50px;
  border: 1px solid #000;
  padding: 5px 15px;
  margin: 10px 0;
  background: #fff;
`;

const RepoTitle = styled.a`
  text-decoration: none;
  color: #000;
  font-weight: bold;
`;
