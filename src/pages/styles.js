import styled, { keyframes } from 'styled-components';
import { darken, lighten } from 'polished';


const animateStripes = keyframes`
  from {
    background-position: 0px 0px;
  }

  to {
    background-position: 120% 0px;
  }
`;


export const Container = styled.div`
  width: 100vw;
`;

export const Header = styled.header`
  width: 100%;
  padding: 30px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: center;
  background-image: linear-gradient(45deg, 
    ${props => props.theme.background} 25%, 
    ${props => lighten(0.008, props.theme.background)} 25%, 
    ${props => lighten(0.008, props.theme.background)} 50%, 
    ${props => props.theme.background} 50%, 
    ${props => props.theme.background} 75%, 
    ${props => lighten(0.008, props.theme.background)} 75%, 
    ${props => lighten(0.008, props.theme.background)} 100%);
  background-size: 56.57px 56.57px;
  color: ${props => props.theme.textColor};

  h1 {
    font-family: 'Montserrat', sans-serif;
    font-size: 30px;
    text-transform: uppercase;
    color: ${props => props.theme.primary};
  }

  h2 {
    font-size: 22px;
    display: flex;
    align-items: center;

    svg {
      margin: 0 5px;
    }
  }

  span {
    font-size: 15px;

    &:first-child {
      span {
        font-size: 24px;
      }
    }
  }

  div {
    justify-self: left;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    @media(max-width: 520px) {
      order: 1;
    }
  }
  
  .gatsby-image-wrapper {
    border-radius: 10px;
    justify-self: right;

    @media(max-width: 520px) {
      order: 2;
    }

    @media(max-width: 600px) {
      justify-self: center;
    }
  }

  img, div {
    @media(max-width: 320px) {
      text-align: center;

      h2 {
        justify-content: center;
      }
    }

    @media(max-width: 600px) {
      justify-self: center;
    }
  }
`;

export const Main = styled.main`
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Section = styled.section`
  width: 90vw;
  max-width: 650px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${props => darken(0.03, props.theme.textColor)};

  h2 {
    font-family: 'Montserrat', sans-serif;
    text-align: center;
    text-transform: uppercase;
    color: ${props => props.theme.primary};
  }

  .tech-logos {
    margin: 20px 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    svg {
      margin: 0 3px;
    }  
  }

  p {
    font-size: 14px;
    margin: 5px 0;
    line-height: 1.5em;
    text-align: justify;
    text-align-last: center;

    a {
      text-decoration: none;
      font-weight: bold;
      color: ${props => props.theme.primary};
    }

    span {
      font-weight: bold;
    }
    
    .course-name {
      font-size: 15px;
      font-weight: bold;
    }

    .html {
      color: #e34f26;
    }

    .css {
      color: #016DB5;
    }

    .javascript {
      color: #f7df1e;
    }

    .react-js {
      color: #3b5998;
    }

    .react-native {
      color: #00d8ff;
    }

    .node-js {
      color: #6cc24a;
    }

    .git {
      color: #F05033;
    }

  }

  form {
    width: 90vw;
    max-width: 500px;
    margin-top: 30px;
    font-size: 15px;
    color: ${props => darken(0.3, props.theme.textColor)};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .input-group {
      display: flex;
      flex-direction: column;
      width: 100%;

      textarea {
        resize: none;
        width: 100%;
        height: 100px;
      }

      input, textarea {
        margin-top: 5px;
        margin-bottom: 15px;
        padding: 5px;
        font-size: 14px;
        line-height: 2em;
        border: none;
        border-radius: 5px;
        color: ${props => darken(0.2,props.theme.textColor)};
        background-color: ${props => darken(0.03, props.theme.background)};
      }

      input:-webkit-autofill,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus,
      select:-webkit-autofill,
      select:-webkit-autofill:hover,
      select:-webkit-autofill:focus {
        -webkit-text-fill-color: ${props => darken(0.2,props.theme.textColor)};
        -webkit-box-shadow: 0 0 0px 1000px ${props => darken(0.03, props.theme.background)} inset;
        transition: background-color 5000s ease-in-out 0s;
      }

      input:focus, textarea:focus {
        box-shadow: 0 0 2px ${props => props.theme.primary};
      }
    }

    button {
      width: 150px;
      height: 50px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 5px;
      background-image: linear-gradient(45deg, 
        ${props => props.theme.primary} 25%, 
        ${props => lighten(0.03, props.theme.primary)} 25%, 
        ${props => lighten(0.03, props.theme.primary)} 50%, 
        ${props => props.theme.primary} 50%, 
        ${props => props.theme.primary} 75%, 
        ${props => lighten(0.03, props.theme.primary)} 75%, 
        ${props => lighten(0.03, props.theme.primary)} 100%);
      background-size: 35px 35px;
      color: ${props => lighten(0.5, props.theme.textColor)};
      font-size: 20px;
      font-weight: bold;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
      transition: background 0.5s;

      &:hover {
        cursor: pointer;
        animation: ${animateStripes} 1s linear infinite;

        svg {
          transform: translate(3px, -3px);
        }
      }

      svg {
        margin-left: 5px;
        transition: 0.5s;
      }
    }
  }

  .social {
    margin-top: 20px;
    font-size: 12px;
    text-align: center;
    color: ${props => darken(0.3,props.theme.textColor)};

    .social-icons {
      margin-top: 10px;
      
      svg {
        margin: 0 5px;
      }
    }
  }
`;
