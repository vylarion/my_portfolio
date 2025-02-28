

function Header() {
    return(
        <div className="font-sans text-amber-50 flex justify-between max-w-[1700px] items-center px-10 py-15 m-auto ">
            <h1 className="w-full text-3xl font-bold tracking-widest "><a href="">samya.</a></h1>
            <ul className="flex ">
                <li className="p-7 font-medium tracking-wider"><a href="">Home</a></li>
                <li className="p-7 font-medium tracking-wider"><a href="">About</a></li>
                <li className="p-7 font-medium tracking-wider"><a href="">Projects</a></li>
                <li className="p-7 font-medium tracking-wider"><a href="">Contact</a></li>
            </ul>

        </div>
        
    );
}

export default Header