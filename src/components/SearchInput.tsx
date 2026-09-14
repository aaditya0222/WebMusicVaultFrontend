import React from "react";
interface SearchInputProps {
  inputRef: InputRef;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  debounceSearch: (value: string, delay: number) => void;
}
const SearchInput: React.FC<SearchInputProps> = ({
  inputRef,
  query,
  setQuery,
  debounceSearch,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value, 400);
  };
  return (
    <div className="flex justify-center">
      <input
        ref={inputRef}
        value={query}
        onChange={handleChange}
        className="
          w-full p-3 border-2 rounded-lg mb-[14px]
          bg-white/10 text-white
          border-white/20
          placeholder-purple-200/60
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
        "
        type="text"
        placeholder="Start typing to find your favorite songs!"
      />
    </div>
  );
};

export default SearchInput;
