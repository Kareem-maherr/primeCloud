import React from 'react';
import styled from 'styled-components';
import { SxProps, Theme } from '@mui/material';

interface CustomBarProps {
  placeholder?: string;
  onSearch: (term: string) => void;
  sx?: SxProps<Theme>;
}

const CustomBar: React.FC<CustomBarProps> = ({ placeholder = 'Search', onSearch, sx }) => {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <StyledWrapper style={sx as React.CSSProperties}>
      <div className="group">
        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
          </g>
        </svg>
        <input 
          placeholder={placeholder} 
          type="search" 
          className="input" 
          onChange={handleSearch}
        />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  
  .group {
    display: flex;
    line-height: 28px;
    align-items: center;
    position: relative;
    width: 100%;
  }

  .input {
    height: 40px;
    line-height: 28px;
    padding: 0 1rem;
    width: 100%;
    padding-left: 2.5rem;
    border: 2px solid transparent;
    border-radius: 8px;
    outline: none;
    background-color: #d4e6f1;
    color: #0d0c22;
    box-shadow: 0 0 5px #C1D9BF, 0 0 0 10px #f5f5f5eb;
    transition: .3s ease;
  }

  .input::placeholder {
    color: #777;
  }

  .icon {
    position: absolute;
    left: 1rem;
    fill: #777;
    width: 1rem;
    height: 1rem;
  }
`;

export default CustomBar;
