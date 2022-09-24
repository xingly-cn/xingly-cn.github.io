const Gradient_Spinner = `
	<div class="spinner-box">
		<div class="circle-border">
			<div class="circle-core"></div>
		</div>
	</div>
`

const Spinner_Orbits = `
	<div class="spinner-box">
		<div class="blue-orbit leo"></div>
		<div class="green-orbit leo"></div>
		<div class="red-orbit leo"></div>
		<div class="white-orbit w1 leo"></div>
		<div class="white-orbit w2 leo"></div>
		<div class="white-orbit w3 leo"></div>
	</div>
`

const Gradient_Circle_Planes = `
	<div class="spinner-box">
		<div class="leo-border-1">
			<div class="leo-core-1"></div>
		</div>
		<div class="leo-border-2">
			<div class="leo-core-2"></div>
		</div>
	</div>
`

const Spinner_Squares = `
	<div class="spinner-box">
		<div class="configure-border-1">
			<div class="configure-core"></div>
		</div>
		<div class="configure-border-2">
			<div class="configure-core"></div>
		</div>
	</div>
`

const Solar_System = `
	<div class="spinner-box">
		<div class="solar-system">
			<div class="earth-orbit orbit">
				<div class="planet earth"></div>
				<div class="venus-orbit orbit">
					<div class="planet venus"></div>
					<div class="mercury-orbit orbit">
						<div class="planet mercury"></div>
						<div class="sun"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
`

const Three_Wire = `
	<div class="spinner-box">
		<div id="loader"></div>

		<div class="loader-section section-left"></div>
		<div class="loader-section section-right"></div>
	</div>
`

const useLoadingHtml = (dom) => {
	const template = [
		Gradient_Spinner,
		Spinner_Orbits,
		Gradient_Circle_Planes,
		Spinner_Squares,
		Solar_System,
		Three_Wire
	]
	const random = Math.floor(Math.random() * template.length)
	dom.innerHTML += template[random]
	document.title = 'loading...'
}
