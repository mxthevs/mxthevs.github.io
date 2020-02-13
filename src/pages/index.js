import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import {
  FaCode,
  FaReact, 
  FaNodeJs, 
  FaGitAlt, 
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaGithub,
  FaInstagram } from 'react-icons/fa';
import { IoIosRocket } from 'react-icons/io';

import HelmetWrapper from '../components/HelmetWrapper';
import Icon from '../components/Icon';

import { Container, Header, Main, Section } from './styles';
import theme from '../styles/themes/dark';

import { externalLinks, techs, social  } from '../../config/siteMetadata';

export default ({ data }) => {
  const [techIcons, setTechIcons] = useState(null);
  const [socialIcons, setSocialIcons] = useState(null);

  useEffect(() => {
    setTechIcons({
      FaHtml5, 
      FaCss3Alt, 
      FaJs, 
      FaNodeJs,
      FaReact,
      FaGitAlt,
    });
  }, [])

  useEffect(() => {
    setSocialIcons({
      FaGithub,
      FaInstagram,
    });
  }, []);

  return(
    <>
      <HelmetWrapper />
      <Container>
        <Header>
          <Img 
            fluid={data.file.childImageSharp.fluid}
            style={{ width: 200}}
            alt="Matheus Henrique"
          />
          <div>
            <span>Oi 
              <span role="img" aria-label="Mão Acenando: Pele Clara">👋🏻</span>
              , eu sou o
            </span>
            <h1>Matheus Henrique</h1>
            <span>e sou um</span>
            <h2>Desenvolvedor Web <FaCode color="#6441A5"/></h2>
          </div>
        </Header>

        <Main>
          <Section>
            <h2>Sobre mim</h2>
            <p> 
              Em 2017 entrei no curso de <span className="course-name">T&eacute;cnico em 
              Inform&aacute;tica</span> da <a href={externalLinks[0].url}>ETEC Cafel&acirc;ndia </a> 
              e l&aacute; conheci o desenvolvimento web. Foi amor a primeira vista.
              Ent&atilde;o, passei a estudar mais a fundo a 
              <em lang="en">Triforce</em> da web: HTML, CSS e JS, al&eacute;m de um 
              pouco de UI/UX pra completar todo o processo.
            </p>
            <p>
              Como um desenvolvedor <em lang="en">Fullstack</em>, tamb&eacute;m 
              conhe&ccedil;o um pouco das t&eacute;cnicas de desenvolvimento de serviços web e 
              banco de dados, para criar solu&ccedil;&otilde;es mais robustas e poderosas.
            </p>
            <p>
              Hoje sou aluno do curso de <span className="course-name">An&aacute;lise e 
              Desenvolvimento de Sistemas</span> da <a href={externalLinks[1].url}>FATEC Lins</a>,
              onde pretendo dar continuidade aos meus estudos na &aacute;rea de desenvolvimento web.
            </p>
          </Section>

          <Section>
            <h2>O que sei</h2>
            <div className="tech-logos">
              {techIcons && techs.map((tech, index) => (
                <Icon
                  key={index} 
                  component={techIcons[tech.iconName]}
                  size={36}
                  color={theme.textColor}
                  hoverColor={tech.color}
                />
              ))}
            </div>
            <p>
              Dedico meu tempo livre para estudar as tecnologias de desenvolvimento
              mais modernas do mercado, tanto para construção de interfaces, quanto 
              para o desenvolvimento de serviços web mais complexos, mas claro, não esquecendo de estar
              sempre em atualizacão com os pilares: <span className="html">HTML</span>, <span className="css">CSS</span> e <span className="javascript">JavaScript</span>.
            </p>
            <p>
              Hoje, dou preferência à stack de <span className="react-js">React</span> e <span className="react-native">React Native </span> no <em lang="en">frontend</em> e <em lang="en">mobile</em> e&nbsp;
              <span className="node-js">Node.js</span> no <em lang="en">backend</em>.
            </p>
            <p>
              Para integrar as aplicações, estudo também técnicas de desenvolvimento para banco de dados <strong>relacionais</strong> e <strong>não relacionais</strong>.
              Além disso, também possuo conhecimento em versionamento de código, utilizando <span className="git">Git</span>.
            </p>      
          </Section>

          <Section>
            <h2>Fale Comigo</h2>

            <form>
              <div className="input-group">
                <label htmlFor="name">Seu nome</label>
                <input type="text" id="name"/>
              </div>

              <div className="input-group">
                <label htmlFor="email">Seu email</label>
                <input type="text" id="email"/>
              </div>

              <div className="input-group">
                <label htmlFor="subject">Assunto</label>
                <input type="text" id="subject"/>
              </div>

              <div className="input-group">
                <label htmlFor="message">Sua mensagem</label>
                <textarea id="message"/>
              </div>

              <button type="submit">
                Enviar
                <IoIosRocket />
              </button>
            </form>

            <div className="social">
              <span>Você também pode me encontrar aqui: </span>
              <div className="social-icons">
              {socialIcons && social.map((social, index) => (
                <a key={index} href={social.url} aria-label={social.name}>
                  <Icon 
                    component={socialIcons[social.iconName]} 
                    size={24} 
                    color={theme.primary}
                  />
                </a>
              ))}
              </div>
            </div>
          </Section>
        </Main>
      </Container>
    </>
  );
  
};

export const query = graphql`
  query {
    file(relativePath: { eq: "me.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 200, quality: 100) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`
